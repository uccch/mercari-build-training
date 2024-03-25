import React, { useEffect, useState} from 'react';

interface Item {
  id: number;
  name: string;
  category: string;
  image_name: string;
};

const server = process.env.REACT_APP_API_URL || 'http://127.0.0.1:9000';
const placeholderImage = process.env.PUBLIC_URL + '/logo192.png';

interface Prop {
  reload?: boolean;
  onLoadCompleted?: () => void;
}

export const ItemList: React.FC<Prop> = (props) => {
  const { reload = true, onLoadCompleted } = props;
  const [items, setItems] = useState<Item[]>([])
  const [searchKeyword, setSearchKeyword] = useState<string>(''); // 検索キーワードの状態を追加

  const fetchItems = () => {
    let url = server.concat('/items');
    if (searchKeyword) {
      url += `?keyword=${encodeURIComponent(searchKeyword)}`; // キーワードをURLエンコードして追加
    }

    fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log('GET success:', data);
      setItems(data.items);
      onLoadCompleted && onLoadCompleted();
    })
    .catch(error => {
      console.error('GET error:', error)
    });
  }

  useEffect(() => {
    if (reload || searchKeyword) { // reload または searchKeyword が変更された場合に実行
      if (searchKeyword) {
        fetch(`${server}/search?keyword=${encodeURIComponent(searchKeyword)}`)
          .then(response => response.json())
          .then(data => setItems(data.items)) // 検索結果をセット
          .catch(error => console.error('Error fetching items:', error));
      } else {
        fetchItems(); // 検索キーワードがない場合は通常のアイテム取得
      }
    }
  }, [reload, searchKeyword]); // reload と searchKeyword の変更を監視
  

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const keyword = formData.get('keyword') as string;
    setSearchKeyword(keyword);
  }

  return (
    <div>
      {/* 検索フォーム */}
      <form onSubmit={handleSearch} className='search-form-5'>
        <input type="text" name="keyword" placeholder="キーワードを入力" />
        <button type="submit">検索</button>
      </form>

      {/* アイテムリスト */}
      <div className='ItemList'>
        {items.map((item, index) => (
          <div key={item.id} className='Item'>
            <br />
            <img src={`http://localhost:9000/image/${item.image_name}`} alt={item.name} />
            <p style={{ textAlign: 'center' }}>
              <span>item: {item.name}</span>
              <br />
              <span>category: {item.category}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
};
