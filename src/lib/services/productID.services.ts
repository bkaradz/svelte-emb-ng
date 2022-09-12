import prisma from "$lib/prisma/client";

/**
 * Note using Methods is too slow does not give expected results
 */
export const incProductID = (productID: string): string => {
  const oldProductID = productID.replace(/-/g, ''); // remove - from string
  const strProductID = (parseInt(oldProductID) + 1).toString(); // convert to int and add one then covert to string
  productID = `${strProductID.slice(0, 3)}-${strProductID.slice(3, 6)}-${strProductID.slice(6)}`;
  return productID;
};
/**
 * Note using Methods is too slow does not give expected results
 */
export const getCurrentProductID = async () => {
  try {
    // const products = await ProductsModel.find({}).sort({ id: -1 }).limit(1).select('productID');
    const products = await prisma.products.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    })
    let productID = '';
    if (products.length === 0) {
      // set the productID to the initial Value xxx-xxx-xxxx (xxx-xxx-xxxx)
      productID = '100-000-0000';
    } else {
      productID = products[0].productID;
    }
    return productID;
  } catch (err: any) {
    throw new Error(`Error ${err.message}`);
  }
};