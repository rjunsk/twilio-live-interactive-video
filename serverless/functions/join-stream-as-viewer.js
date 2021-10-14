/* global Twilio Runtime */
'use strict';

const AccessToken = Twilio.jwt.AccessToken;
const SyncGrant = AccessToken.SyncGrant;
const MAX_ALLOWED_SESSION_DURATION = 14400;

module.exports.handler = async (context, event, callback) => {
  const common = require(Runtime.getAssets()['/common.js'].path);
  const { getPlaybackGrant } = common(context, event, callback);

  const { user_identity, stream_name } = event;

  let response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');

  if (!user_identity) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'missing user_identity',
        explanation: 'The user_identity parameter is missing.',
      },
    });
    return callback(null, response);
  }

  if (!stream_name) {
    response.setStatusCode(400);
    response.setBody({
      error: {
        message: 'missing stream_name',
        explanation: 'The stream_name parameter is missing.',
      },
    });
    return callback(null, response);
  }

  let room, streamDocument, viewerDocument;

  const client = context.getTwilioClient();
  const syncClient = client.sync.services(context.SYNC_SERVICE_SID);

  try {
    // See if a room already exists
    room = await client.video.rooms(stream_name).fetch();
  } catch (e) {
    console.error(e);
    response.setStatusCode(500);
    response.setBody({
      error: {
        message: 'error finding room',
        explanation: e.message,
      },
    });
    return callback(null, response);
  }

  // Create viewer document
  try {
    viewerDocument = await syncClient.documents.create({
      uniqueName: `viewer-${room.sid}-${user_identity}`,
      data: {
        hand_raised: false,
        speaker_invite: false,
      },
    });
    // Give viewer permissions to write to viewer document
    await syncClient
      .documents(viewerDocument.sid)
      .documentPermissions(user_identity)
      .update({ read: true, write: true, manage: false });
  } catch (e) {
    // Ignore "Unique name already exists" error
    if (e.code !== 54301) {
      console.error(e);
      response.setStatusCode(500);
      response.setBody({
        error: {
          message: 'error creating stream document',
          explanation: e.message,
        },
      });
      return callback(null, response);
    }
  }

  try {
    // Get playerStreamerSid from stream document
    streamDocument = await syncClient.documents(`stream-${room.sid}`).fetch();
  } catch (e) {
    response.setStatusCode(500);
    response.setBody({
      error: {
        message: 'error finding stream document',
        explanation: e.message,
      },
    });
    return callback(null, response);
  }

  let playbackGrant;
  try {
    playbackGrant = await getPlaybackGrant(streamDocument.data.playerStreamerSid);
  } catch (e) {
    console.error(e);
    response.setStatusCode(500);
    response.setBody({
      error: {
        message: 'error getting playback grant',
        explanation: e.message,
      },
    });
    return callback(null, response);
  }

  // Create token
  const token = new AccessToken(context.ACCOUNT_SID, context.TWILIO_API_KEY_SID, context.TWILIO_API_KEY_SECRET, {
    ttl: MAX_ALLOWED_SESSION_DURATION,
  });

  // Add participant's identity to token
  token.identity = event.user_identity;

  // Add player grant to token
  token.addGrant({
    key: 'player',
    player: playbackGrant,
    toPayload: () => playbackGrant,
  });

  // Add sync grant to token
  const syncGrant = new SyncGrant({ serviceSid: context.SYNC_SERVICE_SID });
  token.addGrant(syncGrant);

  // Return token
  response.setStatusCode(200);
  response.setBody({
    token: token.toJwt(),
    sync_object_names: {
      raised_hands_map: `raised_hands-${room.sid}`,
      viewer_document: `viewer-${room.sid}-${user_identity}`,
    },
  });

  callback(null, response);
};
