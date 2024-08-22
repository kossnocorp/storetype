import { getApp } from "firebase-admin/app";
import { initializeFirestore } from "firebase-admin/firestore";

export const firestoreSymbol = Symbol();

export function firestore(options) {
  const appName = options?.server?.app || options?.app;
  const app = getApp(appName);
  const databaseId = options?.server?.databaseId || options?.databaseId
  const firestoreOpts = {
    ...(options?.server?.preferRest ? {preferRest: true} : {}),
  }

  initializeFirestore(
    ...[app, firestoreOpts, databaseId].map(v => !!v)
  )
}
