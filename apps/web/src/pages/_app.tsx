import Head from "next/head";
import type { AppProps } from "next/app";
import { NavClient } from "@/components/nav-client";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Stock Tracker</title>
        <meta name="description" content="Track customer stock and accessories" />
      </Head>
      <NavClient />
      <Component {...pageProps} />
    </>
  );
}
