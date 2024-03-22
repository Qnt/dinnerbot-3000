async function getMeals(searchIngredient) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchIngredient}`
  );
  if (!res.ok) {
    console.log('oops');
    return;
    //TODO propper error handling
  }
  const mealsShort = await res.json();

  const mealsDetailed = await Promise.all(
    mealsShort.meals.map(async meal => {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
      );
      if (!res.ok) {
        console.log('oops');
        return;
        //TODO propper error handling
      }
      const mealDetailed = await res.json();
      return mealDetailed.meals[0];
    })
  );

  return mealsDetailed;
}

const searchInputEl = document.getElementById('search-input');
const searchButtonEl = document.querySelector('.search-button');
const recipeCountEl = document.querySelector('.recipe-count');
const mealCardEl = document.querySelector('.meal-card');
const mealTitleEl = document.querySelector('.meal-title');
const mealImageEl = document.querySelector('.meal-image');
const mealInstractionEl = document.querySelector('.meal-instraction');
const mealIngredientEl = document.querySelector('.meal-ingredient');
const mealVideoEl = document.querySelector('.meal-ingredient');

function showRecipeCount(meals) {
  let recipeCountText;
  if (!meals.meals) {
    recipeCountText = 'No recipes found ☹️';
  } else if (meals.meals.length === 1) {
    recipeCountText = `Found ${meals.meals.length} recipe`;
  } else {
    recipeCountText = `Found ${meals.meals.length} recipes`;
  }
  recipeCountEl.textContent = recipeCountText;
}

searchButtonEl.addEventListener('click', async event => {
  event.preventDefault();
  const searchValue = searchInputEl.value;

  if (!searchValue) {
    console.log('Enter valid value');
    return;
  }
  const meals = await getMeals(searchInputEl.value);
  console.log(meals);
  showRecipeCount(meals);

  const meal = meals.meals[0];
});
