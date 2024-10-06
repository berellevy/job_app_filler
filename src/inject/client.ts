import { Client } from '../utils/crossContextCommunication/client'
export const client = new Client(process.env.CONTENT_SCRIPT_URL)