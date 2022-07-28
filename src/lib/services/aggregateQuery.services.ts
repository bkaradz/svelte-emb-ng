import logger from '$lib/utility/logger';
import type { ContactsDocument } from '../models/contacts.model';

export interface paginationNavInterface {
	page: number;
	limit: number;
}

export interface metaDataInterface {
	error: boolean;
	totalRecords: number;
	totalPages: number;
	previous: paginationNavInterface;
	current: paginationNavInterface;
	next: paginationNavInterface;
}

export interface aggregateQueryInterface {
	metaData: Array<metaDataInterface>;
	results: Omit<ContactsDocument, 'createdAt' | 'updatedAt' | 'password'>[];
}

const aggregateQuery = async (searchQuery, model, aggregateFilter, endSearchParams) => {
	try {
		const limit = endSearchParams.limit;
		const page = endSearchParams.page;

		const endIndex = endSearchParams.endIndex;

		let next = endSearchParams.next;
		const current = endSearchParams.current;

		const results: aggregateQueryInterface = await model.aggregate(aggregateFilter).exec();

		let metaData: Partial<metaDataInterface> = {
			totalRecords: 0,
			error: false,
			next: null,
			totalPages: 0
		};

		if (!results[0].metaData[0]) {
			results[0].metaData.push({ totalRecords: 0, limit: 15, previous: null, current, next: null });
			metaData = results[0].metaData[0];
		} else {
			metaData = results[0].metaData[0];
		}

		if (endIndex < metaData.totalRecords) {
			next = {
				page: page + 1,
				limit
			};
		}

		const totalPages = Math.ceil(metaData.totalRecords / limit);

		metaData.error = false;
		metaData.next = next;
		metaData.totalPages = totalPages;

		return results[0];
	} catch (err) {
		logger.error(err.message);
		throw new Error(`Error ${err.message}`);
	}
};

export default aggregateQuery;
