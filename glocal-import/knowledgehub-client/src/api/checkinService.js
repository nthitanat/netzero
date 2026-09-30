import { axiosInstance } from './client';

const BASE_PATH = '/api/v1/glocal/survey-checkins';

// Public guest flow — verify whether the given email has completed the
// registration survey. Returns { completed, redirectUrl? } inside data.data.
export const verifyCheckin = (email) =>
  axiosInstance.post(`${BASE_PATH}/verify`, { email });
