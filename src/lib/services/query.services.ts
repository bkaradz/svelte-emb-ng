import logger from '$lib/utility/logger';
import  omit from 'lodash-es/omit';

const query = async (searchQuery, model) => {
	try {
		interface paginationNavInterface {
			page: number;
			limit: number;
		}
		interface metaDataInterface {
			error: boolean;
			totalRecords: number;
			totalPages: number;
			limit: number;
			previous: paginationNavInterface | null;
			current: paginationNavInterface | null;
			next: paginationNavInterface | null;
		}
		interface resultsInterface {
			metaData: Array<metaDataInterface>;
			results: [];
		}

		const results: resultsInterface = {
			metaData: [
				{
					error: false,
					totalRecords: 0,
					totalPages: 0,
					limit: 12,
					previous: null,
					next: null,
					current: null
				}
			],
			results: []
		};

		let { limit = 15, page = 1 } = searchQuery;

		const { sort = 'name' } = searchQuery;

		const finalQuery = omit(searchQuery, ['page', 'limit', 'sort']);

		// const finalQuery = JSON.parse(query)

		const objectKeys = Object.keys(finalQuery);

		let newRegExQuery = {};

		objectKeys.forEach((name) => {
			if (name === 'isCorporate' || name === 'isUser' || name === 'isActive') {
				const value = finalQuery[name] === 'true' ? true : false;
				newRegExQuery = { ...newRegExQuery, [name]: value };
			} else {
				const regexValue = new RegExp(finalQuery[name], 'ig');
				newRegExQuery = { ...newRegExQuery, [name]: regexValue };
			}
		});

		limit = parseInt(limit) < 1 ? 1 : parseInt(limit);
		page = parseInt(page);

		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		const totalRecords = await model.countDocuments(newRegExQuery).exec();

		results.metaData = [];
		const metaDataTemp: metaDataInterface = {
			error: false,
			totalRecords: 0,
			totalPages: 0,
			limit: 0,
			previous: null,
			current: null,
			next: null
		};
		metaDataTemp.totalRecords = totalRecords;
		metaDataTemp.totalPages = Math.ceil(totalRecords / limit);
		metaDataTemp.limit = limit;

		metaDataTemp.previous = null;
		metaDataTemp.next = null;

		if (startIndex > 0) {
			metaDataTemp.previous = {
				page: page - 1,
				limit
			};
		}

		metaDataTemp.current = {
			page: page,
			limit
		};

		if (endIndex < totalRecords) {
			metaDataTemp.next = {
				page: page + 1,
				limit
			};
		}

		results.results = await model
			.find(newRegExQuery)
			.select('-password -createdAt -updatedAt -__v -userRole')
			.limit(limit)
			.skip(startIndex)
			.sort(sort)
			.exec();

		results.metaData.push(metaDataTemp);

		return results;
	} catch (err) {
		logger.error(err.message);
		throw new Error(`Error ${err.message}`);
	}
};

export default query;
