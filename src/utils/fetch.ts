import { GraphQLContext } from "#context";
import axios from "axios";

export async function fetchSafeResource<T>(
  ctx: GraphQLContext,
  endpoint: string
): Promise<T | null> {
  try {
    const { data } = await ctx.spotify.get(endpoint);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      
      throw new Error("UNAUTHORIZED_SPOTIFY");
    }
    return null; 
  }
}
