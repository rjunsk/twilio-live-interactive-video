import React from 'react';
import useCaptionContext from '../../hooks/useCaptionsContext/useCaptionsContext';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles({
  captionContainer: {
    position: 'fixed',
    left: '15%',
    right: '15%',
    top: 'calc(100% - 300px)',
    zIndex: 100,
  },
  caption: {
    color: 'white',
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '0.2em',
    display: 'inline-block',
  },
});

export function CaptionRenderer() {
  const classes = useStyles();
  const { captions } = useCaptionContext();

  return (
    <div className={classes.captionContainer}>
      {captions.map(caption => (
        <div>
          <Typography variant="h6" key={caption.id} className={classes.caption}>
            {caption.identity}: {caption.transcript}
          </Typography>
        </div>
      ))}
    </div>
  );
}
