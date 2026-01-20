// * base URL for the API
const NEXT_PUBLIC_API_URL: string = process.env.NEXT_PUBLIC_API_URL ?? "";

export const config = {
  url: { api: NEXT_PUBLIC_API_URL },
};
