import { useContext } from 'react';
import { CaptionContext } from '../../components/CaptionsProvider/CaptionsProvider';

export default function useCaptionContext() {
  const context = useContext(CaptionContext);
  if (!context) {
    throw new Error('useCaptionContext must be used within a CaptionProvider');
  }
  return context;
}
