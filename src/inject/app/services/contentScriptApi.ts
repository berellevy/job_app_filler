import { Client } from "@src/shared/utils/crossContextCommunication/client";
export const contentScriptAPI = new Client(process.env.CONTENT_SCRIPT_URL)