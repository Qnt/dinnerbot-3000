async function getMeals(searchIngredient) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchIngredient}`
  );
  if (!res.ok) {
    console.log('oops');
    return;
    //TODO propper error handling
  }
  const data = await res.json();
  console.log(data);

  return data;
}

const searchInputEl = document.getElementById('search-input');
const searchButtonEl = document.querySelector('.search-button');

searchButtonEl.addEventListener('click', event => {
  event.preventDefault();
  const searchValue = searchInputEl.value;

  if (!searchValue) {
    console.log('Enter valid value');
    return;
  }
  const meals = getMeals(searchInputEl.value);
});
