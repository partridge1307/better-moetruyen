"use client";

import { signOut } from "next-auth/react";

const ForceSignOut = () => {
  return signOut({
    callbackUrl: `${window.location.protocol}//${window.location.hostname}/sign-in`,
  });
};

export default ForceSignOut;
