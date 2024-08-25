import { getApp } from "firebase-admin/app";
import { initializeFirestore } from "firebase-admin/firestore";

export const firestoreSymbol = Symbol();

export function firestore(options) {
  const appName = options?.server?.app || options?.app;
  const app = getApp(appName);
  if(!app){
    if(appName) throw new Error(`Supplied Firebase app (${appName}) does not exist -- did you initialize it?`)
    throw new Error('The default Firebase app does not exsist -- did you initialize it?')
  }
  const databaseId = options?.server?.databaseId || options?.databaseId
  const firestoreOpts = {
    ...(options?.server?.preferRest ? {preferRest: true} : {}),
  }

  return initializeFirestore(app, firestoreOpts, databaseId)
}
