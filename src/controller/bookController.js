const axios = require('axios');
const cheerio = require('cheerio');

// Custom headers to mimic a real browser request
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
};

// Function to scrape Amazon prices
async function scrapeAmazon(bookDetails) {
  try {
    const amazonUrl = `https://www.amazon.in/s?k=${bookDetails.title}+${bookDetails.authors[0]}+paperback`;
    const { data } = await axios.get(amazonUrl, { headers });
    const $ = cheerio.load(data);
    const prices = [];
    
    $('span.a-price-whole').each((index, element) => {
      if (index >= 5) return false;
      const price = $(element).text().trim();
      if (price) {
        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericPrice) && numericPrice > 0) {
          prices.push(numericPrice);
        }
      }
    });
    
    prices.sort((a, b) => a - b);
    return prices[0] || 0;
  } catch (error) {
    console.error('Error scraping Amazon:', error);
    return 0;
  }
}

// Function to scrape Flipkart prices
async function scrapeFlipkart(bookDetails) {
  try {
    const flipkartUrl = `https://www.flipkart.com/search?q=${bookDetails.title}+${bookDetails.authors[0]}+paperback`;
    const { data } = await axios.get(flipkartUrl, { headers });
    const $ = cheerio.load(data);
    const prices = [];
    
    $('div.Nx9bqj').each((index, element) => {
      if (index >= 5) return false;
      const price = $(element).text().trim();
      if (price) {
        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericPrice) && numericPrice > 0) {
          prices.push(numericPrice);
        }
      }
    });
    
    prices.sort((a, b) => a - b);
    return prices[0] || 0;
  } catch (error) {
    console.error('Error scraping Flipkart:', error);
    return 0;
  }
}

// Function to scrape BindassBooks prices
async function scrapeBindassBooks(bookDetails) {
  try {
    const bindassBooksUrl = `https://bindassbooks.com/search?q=${bookDetails.title}+${bookDetails.authors[0]}`;
    const { data } = await axios.get(bindassBooksUrl, { headers });
    const $ = cheerio.load(data);
    const prices = [];
    
    $('.search-price').each((index, element) => {
      if (index >= 5) return false;
      const price = $(element).find('span').text().trim().split('.')[1];
      if (price) {
        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericPrice) && numericPrice > 0) {
          prices.push(numericPrice);
        }
      }
    });
    
    prices.sort((a, b) => a - b);
    return prices[0] || 0;
  } catch (error) {
    console.error('Error scraping BindassBooks:', error);
    return 0;
  }
}

// Function to scrape BookChor prices
async function scrapeBookChor(bookDetails) {
  try {
    const bookChorUrl = `https://www.bookchor.com/search/?query=${bookDetails.title}+${bookDetails.authors[0]}`;
    const { data } = await axios.get(bookChorUrl, { headers });
    const $ = cheerio.load(data);
    const prices = [];
    
    $('.product-price').each((index, element) => {
      if (index >= 5) return false;
      const price = $(element).find('span').text().trim().split('₹')[1];
      if (price) {
        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericPrice) && numericPrice > 0) {
          prices.push(numericPrice);
        }
      }
    });
    
    prices.sort((a, b) => a - b);
    return prices[0] || 0;
  } catch (error) {
    console.error('Error scraping BookChor:', error);
    return 0;
  }
}

// Main function to fetch book details and prices
async function getBookDetails(bookName) {
    try {
      // Replace spaces with '+' for the query parameter
      const query = bookName.split(' ').join('+');
      
      // Send request to Google Books API
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
      
      // Iterate over the first 3 records and check for English language
      let book = null;
      for (let i = 0; i < Math.min(3, response.data.items.length); i++) {
        if (response.data.items[i].volumeInfo.language === 'en') {
          book = response.data.items[i].volumeInfo;
          break;  // Found the first English book, stop the loop
        }
      }
  
      if (book) {
        const bookDetails = {
          title: book.title || "Title not available",
          authors: book.authors ? book.authors : ["Author not available"],
          description: book.description || "Description not available",
          pageCount: book.pageCount || "Page count not available",
          categories: book.categories ? book.categories : ["Categories not available"],
          averageRating: book.averageRating || "Rating not available",
          thumbnail: book.imageLinks ? book.imageLinks.thumbnail : "Thumbnail not available",
          language: book.language || "Language not available",
          infoLink: book.infoLink || "Info link not available"
        };
  
        // Scrape prices from other websites
        const amazonPrice = await scrapeAmazon(bookDetails);
        const flipkartPrice = await scrapeFlipkart(bookDetails);
        const bindassBooksPrice = await scrapeBindassBooks(bookDetails);
        const bookChorPrice = await scrapeBookChor(bookDetails);
  
        // Return the book details and lowest prices
        return {
          ...bookDetails,
          prices: {
            amazon: amazonPrice,
            flipkart: flipkartPrice,
            bindassBooks: bindassBooksPrice,
            bookChor: bookChorPrice
          }
        };
      } else {
        return "No books found in English within the first three records.";
      }
    } catch (error) {
      console.error("Error fetching book data:", error);
      return "An error occurred while fetching book data.";
    }
  }
  

module.exports = { getBookDetails };
