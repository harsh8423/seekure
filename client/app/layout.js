import "./globals.css";


export const metadata = {
  title: "Seekure",
  description: "Seek and secure your dream jobs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
