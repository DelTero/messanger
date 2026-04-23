import { useNavigation } from 'react-router';

import { Spinner } from '@shared/ui/spinner';

export function LoadingIndicator() {
  const navigation = useNavigation();

  if (navigation.state === 'loading') {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-white bg-opacity-70 flex justify-center items-center z-[1000]">
        <div className="flex items-center justify-center h-full">
          <Spinner className="size-16" />
        </div>
      </div>
    );
  }

  return null;
}
