//장바구니로 바로 가도록 연결해놓고 있음
//장바구니이동 선택 시, 이동
import * as Api from '/api.js';

const pluseBtn = document.querySelector('.plus');
const minusBtn = document.querySelector('.minus');
const countEl = document.querySelector('.count');

const productTitle = document.querySelector('.productTitle');

const titleEl = document.querySelector('.title');
const authorEl = document.querySelector('.author');
const publisherEl = document.querySelector('.publisher');
const priceEl = document.querySelector('.price');
const descriptionEl = document.querySelector('.description');
const categoryEl = document.querySelector('.category');
const totalPriceEl = document.querySelector('.totalPrice');

const cart = document.querySelector('.cart');
const order = document.querySelector('.order');
const img = document.querySelector('.img-wrap >img');

const userToken = sessionStorage.token;
const isLogin = Boolean(userToken);

//상품 정보 변수 저장
const product = await loadData();

const { title, author, price, publisher, images, description, category } =
  product;

//페이지에 텍스트 변수 전달
renderProduct();

let count = Number(countEl.innerText);
totalPriceEl.textContent = priceToString(calTotalPrice(price, count));

addAllEvents();

//함수
//데이터 로드
async function loadData() {
  const url = window.location.pathname;
  const productId = url.split('/')[2];

  const product = await Api.get('/api/products', productId);
  productTitle.innerText = product.title;
  return product;
}

//데이터 랜더링
async function renderProduct() {
  titleEl.textContent = title;
  authorEl.textContent = author;
  priceEl.textContent = priceToString(price);
  publisherEl.textContent = publisher;
  img.src = images[0];
  descriptionEl.textContent = description;
  categoryEl.textContent = await getCategoryName();
}

async function getCategoryName() {
  const categoryName = await Api.get('/api/categories', category._id);
  return categoryName.name;
}

//이벤트 처리
function addAllEvents() {
  pluseBtn.addEventListener('click', function () {
    count++;
    countEl.textContent = count;
    totalPriceEl.textContent = priceToString(calTotalPrice(price, count));
  });
  minusBtn.addEventListener('click', function () {
    if (count == 1) {
      console.log('수량확인');
      return;
    } else {
      count--;
      countEl.textContent = count;
      totalPriceEl.textContent = priceToString(calTotalPrice(price, count));
    }
  });
  cart.addEventListener('click', addCarts);
  order.addEventListener('click', orderProduct);
}

function addCarts() {
  let carts = JSON.parse(localStorage.getItem('carts')) || {};
  carts = new Map(Object.entries(carts));
  const id = product._id;
  const cartItem = {
    title: product.title,
    price: product.price,
    count: count,
    totalPrice: calTotalPrice(product.price, count),
    imgaes: product.images,
  };

  if (carts.has(id)) {
    carts.get(id).count += count;
    carts.get(id).totalPrice += calTotalPrice(product.price, count);
    localStorage.setItem('carts', JSON.stringify(Object.fromEntries(carts)));
  } else {
    carts.set(id, cartItem);
    localStorage.setItem('carts', JSON.stringify(Object.fromEntries(carts)));
  }
  const isCart = confirm('장바구니로 이동하시겠습니까?');
  if (isCart) {
    window.location.href = '/cart';
  }
}

function orderProduct() {
  if (!isLogin) {
    let isGo = confirm(
      '로그인이 필요한 서비스입니다. \n로그인창으로 이동하시겠습니까?'
    );
    if (isGo) {
      window.location.href = '/login';
    }
  } else {
    localStorage.removeItem('orderId');

    const cartItem = {
      id: product._id,
      title: product.title,
      price: product.price,
      count: count,
      totalPrice: calTotalPrice(product.price, count),
      images: product.images,
    };
    console.log(cartItem);
    localStorage.setItem('cart', JSON.stringify(cartItem));
    window.location.href = '/order';
  }
}

//총 금액 계산 및 변경
function calTotalPrice(price, count) {
  return price * count;
}

//단위
function priceToString(price) {
  return `${price.toLocaleString('ko-kr')}원`;
}

//헤더부분
//로그인 여부에 따라 상단 메뉴 노출 유무 설정
const login = document.querySelector('#login');
const logout = document.querySelector('#logout');
const adminPage = document.querySelector('#adminPage');
const edit = document.querySelector('#edit');
const editAtag = document.querySelector('#edit a');
const seeOrder = document.querySelector('#seeOrder');
const register = document.querySelector('#register');

//로그인 유저 확인
if (isLogin) {
  checkLogin();
}

async function checkLogin() {
  const loginUser = await Api.get('/api/users', userToken);
  const isUser = loginUser.role === 'user';
  const isAdmin = loginUser.role === 'admin';

  if (sessionStorage && isUser) {
    login.classList.add('hidden');
    register.classList.add('hidden');
    logout.classList.remove('hidden');
    edit.classList.remove('hidden');
    seeOrder.classList.remove('hidden');

    editAtag.innerText = `${loginUser.fullName}님의 프로필`;
    // alert(`${loginUser.fullName}님 안녕하세요!`);
  }

  //관리자 계정일 때
  if (sessionStorage && isAdmin) {
    login.classList.add('hidden');
    register.classList.add('hidden');
    adminPage.classList.remove('hidden');
    logout.classList.remove('hidden');
  }
}
//로그아웃 버튼 클릭시 토큰 삭제
function logoutHandler() {
  sessionStorage.removeItem('token');
}

logout.addEventListener('click', logoutHandler);

//카테고리 메뉴 정보 받기
getCategoryData();

async function getCategoryData() {
  const category = await Api.get('/api/categories');

  for (let i = 0; i < category.length; i++) {
    const showCategory = `<li><a href="/category/${category[i]._id}">${category[i].name}</a></li>`;
    categoryMenu.insertAdjacentHTML('beforeend', showCategory);
  }
}
