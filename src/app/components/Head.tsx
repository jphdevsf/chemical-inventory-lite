import { Helmet } from "react-helmet"

export default function Head() {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Chemical Inventory Lite</title>
      <meta
        name="description"
        content="Chemical Inventory Lite is a lightweight web application designed to help manage chemical inventories efficiently. It provides features for tracking chemical storage, monitoring expiration dates, and simplifying inventory management tasks."
      />
      <link rel="canonical" href="https://chemical-inventory-lite.onrender.com/" />

      <link rel="icon" href="/favicon.ico" />
      <meta name="robots" content="index, follow" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-title" content="Chemical Inventory" />

      <meta name="theme-color" content="#60a5fa" />
    </Helmet>
  )
}
