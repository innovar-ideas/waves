import { getFirestore } from "@firebase/firestore";
import { firebaseApp } from "./fire-base-config";


const db = getFirestore(firebaseApp);

export default db;