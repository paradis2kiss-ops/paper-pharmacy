export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { query, queryType = 'Title' } = req.query;

  if (!query) {
    return res.status(400).json({ error: '검색어를 입력하세요' });
  }

  try {
    const apiKey = process.env.ALADIN_API_KEY;
    
    if (!apiKey) {
      throw new Error('알라딘 API 키가 없습니다');
    }

    const aladinUrl = new URL('http://www.aladin.co.kr/ttb/api/ItemSearch.aspx');
    aladinUrl.searchParams.set('ttbkey', apiKey);
    aladinUrl.searchParams.set('Query', query as string);
    aladinUrl.searchParams.set('QueryType', queryType as string);
    aladinUrl.searchParams.set('MaxResults', '3');
    aladinUrl.searchParams.set('start', '1');
    aladinUrl.searchParams.set('SearchTarget', 'Book');
    aladinUrl.searchParams.set('output', 'js');
    aladinUrl.searchParams.set('Version', '20131101');

    const response = await fetch(aladinUrl.toString());
    
    if (!response.ok) {
      throw new Error(`알라딘 API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    const books = data.item?.map((book: any) => ({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn13 || book.isbn,
      cover: book.cover,
      link: book.link,
      description: book.description || '',
    })) || [];

    res.status(200).json({ books });

  } catch (error) {
    console.error('알라딘 API 오류:', error);
    res.status(500).json({ error: '검색 실패' });
  }
}