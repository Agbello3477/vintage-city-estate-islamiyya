import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Madarasatul Islamiyya wa Tarbiyya",
    short_name: "MIWT Islamiyya",
    description: "School Management & Parent Portal for Madarasatul Islamiyya wa Tarbiyya",
    start_url: "/",
    display: "standalone",
    background_color: "#022c22",
    theme_color: "#064e3b",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icon",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
