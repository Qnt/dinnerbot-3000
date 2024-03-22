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
const mealIngredientEl = document.querySelector('.meal-ingredients');
const mealIngredientTbodyEl = mealIngredientEl.getElementsByTagName('tbody')[0];
const mealInstructionsEl = document.querySelector('.meal-instructions');
const mealVideoEl = document.querySelector('.meal-video');

function showRecipeCount(meals) {
  let recipeCountText;
  if (!meals) {
    recipeCountText = 'No recipes found ☹️';
  } else if (meals.length === 1) {
    recipeCountText = `Found ${meals.length} recipe`;
  } else {
    recipeCountText = `Found ${meals.length} recipes`;
  }
  recipeCountEl.textContent = recipeCountText;
}

function showMealCard(meals) {
  mealCardEl.classList.remove('hidden');
  mealTitleEl.textContent = meals[0].strMeal;
  mealImageEl.setAttribute('src', meals[0].strMealThumb);
  mealInstructionsEl.textContent = meals[0].strInstructions;
  const videoParams = new URL(meals[0].strYoutube).searchParams;
  const videoId = videoParams.get('v');
  mealVideoEl.setAttribute('src', `https://www.youtube.com/embed/${videoId}`);
  const ingredients = extractIngredients(meals[0]);
  fillIngredientTable(ingredients);
}

function extractIngredients(meal) {
  const ingredients = [];

  for (let key in meal) {
    if (key.includes('strIngredient') && meal[key]) {
      let ingredientNum = key.match(/\d+/)[0];
      let strIngredient = meal[key];
      let strMeasure = meal[`strMeasure${ingredientNum}`];
      ingredients.push({ strIngredient, strMeasure });
    }
  }

  return ingredients;
}

function fillIngredientTable(ingredients) {
  ingredients.forEach((ingredient, index) => {
    const trEl = document.createElement('tr');
    const ingredientTdEl = document.createElement('td');
    const measureTdEl = document.createElement('td');
    ingredientTdEl.textContent = ingredient.strIngredient;
    measureTdEl.textContent = ingredient.strMeasure;
    trEl.append(ingredientTdEl, measureTdEl);
    mealIngredientTbodyEl.appendChild(trEl);
  });
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
  showMealCard(meals);
});
