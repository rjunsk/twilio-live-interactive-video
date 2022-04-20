import { useCallback, useState } from 'react';

export default function useCaptionsButtonToggle() {
  const [isCaptionsShown, setCaptionsToggleState] = useState(false);

  const toggleCaptions = useCallback(() => {
    setCaptionsToggleState(prevState => !prevState);
  }, [setCaptionsToggleState]);

  return { isCaptionsShown, toggleCaptions };
}
