import { connect } from 'mongoose';
import config from 'config';
import logger from '$lib/utility/logger';

export async function connectDB() {
	try {
		const MONGODB_URI = config.get<string>('MONGODB_URI');

		await connect(MONGODB_URI);
		logger.info('Database connected.....');
	} catch (err) {
		logger.error(`Could not connect to MongoDB, ${err}`);
		process.exit(1);
	}
}
