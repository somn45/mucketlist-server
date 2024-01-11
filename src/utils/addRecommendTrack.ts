import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi();

export const searchTrackToArtists = async (
  artist: string,
  artistOffset: number,
  accessToken: string
) => {
  spotifyApi.setAccessToken(accessToken);
  const response = await spotifyApi.searchTracks(`artist:${artist}`, {
    limit: 1,
    offset: artistOffset,
  });
  return {
    track: response.body.tracks?.items[0],
    query: 'artists',
  };
};

export const searchTrackToGenres = async (
  genre: string,
  genresOffset: number,
  accessToken: string
) => {
  spotifyApi.setAccessToken(accessToken);
  try {
    const response = await spotifyApi.getRecommendations({
      seed_genres: [genre],
      target_popularity: genresOffset,
      limit: 1,
    });
    const convertedTrack = response.body.tracks[0];
    return {
      track: convertedTrack,
      query: 'genres',
    };
  } catch (error) {
    console.error(error);
  }
};
