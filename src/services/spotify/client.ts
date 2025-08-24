import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

export function createSpotifyClient(token: string | null): AxiosInstance {
  const spotify = axios.create({
    baseURL: process.env.SPOTIFY_API_URL ?? "https://api.spotify.com/v1",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  spotify.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        (error as { isUnauthenticated?: boolean }).isUnauthenticated = true;
      }
      return Promise.reject(error);
    }
  );

  return spotify;
}
