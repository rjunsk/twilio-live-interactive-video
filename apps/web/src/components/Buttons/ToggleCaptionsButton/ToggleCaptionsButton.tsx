import React from 'react';

import Button from '@material-ui/core/Button';

import useCaptionsButtonToggle from '../../../hooks/useCaptionsButtonToggle/useCaptionsButtonToggle';

export default function ToggleCaptionsButton(props: { disabled?: boolean; className?: string }) {
  const { isCaptionsShown, toggleCaptions } = useCaptionsButtonToggle();

  return (
    <Button
      className={props.className}
      onClick={toggleCaptions}
      disabled={props.disabled || false}
      data-cy-audio-toggle
    >
      {isCaptionsShown ? 'Hide CC' : 'Show CC'}
    </Button>
  );
}
