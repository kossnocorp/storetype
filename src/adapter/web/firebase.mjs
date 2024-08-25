import { getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firestoreSymbol = Symbol();

export function firestore(options) {
  const appName = options?.client?.app || options?.app;
  const databaseId = options?.client?.databaseId || options?.databaseId
  const app = getApp(appName);

  if(databaseId){
    return getFirestore(app, databaseId)
  }else{
    return getFirestore(app)
  }
}
