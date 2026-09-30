import { verifyCheckin } from '../../api/checkinService';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CheckInHandler = (stateCheckIn, setCheckIn) => {
  const handleEmailChange = (value) => {
    setCheckIn({ email: value, error: null });
  };

  const handleVerify = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    const email = stateCheckIn.email.trim();

    if (!EMAIL_PATTERN.test(email)) {
      setCheckIn({ status: 'error', error: 'invalidEmail' });
      return;
    }

    setCheckIn({ status: 'loading', error: null });

    try {
      const response = await verifyCheckin(email);
      const { completed, redirectUrl } = response.data.data;

      setCheckIn({
        status: completed ? 'completed' : 'not_completed',
        redirectUrl: redirectUrl || null,
        error: null,
      });
    } catch (error) {
      setCheckIn({
        status: 'error',
        error: error.response?.data?.message || 'genericError',
      });
    }
  };

  const handleRedirect = () => {
    if (stateCheckIn.redirectUrl) {
      window.location.href = stateCheckIn.redirectUrl;
    }
  };

  const handleTryAgain = () => {
    setCheckIn({ status: 'idle', error: null, redirectUrl: null });
  };

  return {
    handleEmailChange,
    handleVerify,
    handleRedirect,
    handleTryAgain,
  };
};

export default CheckInHandler;
