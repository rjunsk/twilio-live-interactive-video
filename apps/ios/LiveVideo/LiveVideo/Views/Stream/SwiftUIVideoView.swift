//
//  Copyright (C) 2021 Twilio, Inc.
//

import SwiftUI
import TwilioVideo

/// A SwiftUI video view that is automatically removed from the video track when the view is no longer in use.
struct SwiftUIVideoView: UIViewRepresentable {
    @Binding var videoTrack: VideoTrack?
    @Binding var shouldMirror: Bool
    var fill: Bool = true

    func makeUIView(context: Context) -> VideoTrackStoringVideoView {
        let videoView = VideoTrackStoringVideoView()
        videoView.contentMode = fill ? .scaleAspectFill : .scaleAspectFit
        return videoView
    }

    func updateUIView(_ uiView: VideoTrackStoringVideoView, context: Context) {
        uiView.videoTrack = videoTrack
        uiView.shouldMirror = shouldMirror
    }
    
    static func dismantleUIView(_ uiView: VideoTrackStoringVideoView, coordinator: ()) {
        print("dismantleUIView")
        uiView.videoTrack?.removeRenderer(uiView)
    }
}

/// A `VideoView` that stores a reference to the `VideoTrack` it renders.
///
/// This makes it easy to update view state when the `VideoTrack` changes. Just set the `VideoTrack` and the
/// view will handle`addRenderer` and `removeRenderer` automatically.
///
/// It also provides a `VideoTrack` reference to `SwiftUIVideoView` so that `SwiftUIVideoView` can
/// remove the `VideoView` from the `VideoTrack` when `dismantleUIView` is called.`
class VideoTrackStoringVideoView: VideoView {
    var videoTrack: VideoTrack? {
        didSet {
            guard oldValue != videoTrack else { return }
            
            print("Stop rendering \(oldValue?.name ?? nil)")
            oldValue?.removeRenderer(self)
            
            if let videoTrack = videoTrack {
                print("Start rendering \(videoTrack.name)")
                videoTrack.addRenderer(self)
            }
        }
    }
    
    override func didMoveToWindow() {
        super.didMoveToWindow()
        print("didMoveToWindow: \(window.debugDescription)")
    }
    
    override func didMoveToSuperview() {
        super.didMoveToSuperview()
        print("didMoveToSuperview: \(superview.debugDescription)")
    }
}
