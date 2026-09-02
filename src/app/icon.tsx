import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 38,
          background: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          border: "2px solid #f59e0b",
        }}
      >
        🕌
      </div>
    ),
    {
      ...size,
    }
  );
}
