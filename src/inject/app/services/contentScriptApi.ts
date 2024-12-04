import { Client } from "../../../shared/utils/crossContextCommunication/client";
export const contentScriptAPI = new Client(process.env.CONTENT_SCRIPT_URL)