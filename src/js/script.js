async function fetchMeals(searchIngredient) {
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

const MealsStore = class extends EventTarget {
  constructor(localStorageKey) {
    super();
    this.localStorageKey = localStorageKey;
    this._readStorage();
    this.all = () => this.meals;
  }
  _readStorage() {
    this.meals = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
  }
  _save() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.meals));
    this.dispatchEvent(new CustomEvent('save'));
  }
  deleteAll() {
    this.meals = [];
    this._save();
  }
  update(meals) {
    this.meals = meals;
    this._save();
  }
};

const Meals = new MealsStore('dinnerbot-3000-meals');

const App = {
  $: {
    searchInputEl: document.getElementById('search-input'),
    searchButtonEl: document.querySelector('.search-button'),
    recipeCountEl: document.querySelector('.recipe-count'),
    mealListEl: document.querySelector('.meals'),

    showRecipeCount(count) {
      let recipeCountText;
      if (!count) {
        recipeCountText = 'No recipes found ☹️';
      } else if (count === 1) {
        recipeCountText = `Found ${count} recipe`;
      } else {
        recipeCountText = `Found ${count} recipes`;
      }
      App.$.recipeCountEl.textContent = recipeCountText;
    },

    showMealList(meal) {
      App.$.mealListEl.classList.remove('hidden');
    },
  },
  init() {
    Meals.addEventListener('save', App.render);
    App.$.searchButtonEl.addEventListener('click', async event => {
      event.preventDefault();
      const searchValue = App.$.searchInputEl.value;

      if (!searchValue) {
        console.log('Enter valid value');
        return;
      }
      const rawMeals = await fetchMeals(App.$.searchInputEl.value);
      const mealsAdapted = resToWantedAdapter(rawMeals);

      Meals.update(mealsAdapted);
    });
  },
  createIngredient(ingredient) {
    const trEl = document.createElement('tr');
    const ingredientTdEl = document.createElement('td');
    const measureTdEl = document.createElement('td');
    ingredientTdEl.textContent = ingredient.strIngredient;
    measureTdEl.textContent = ingredient.strMeasure;
    trEl.append(ingredientTdEl, measureTdEl);
    return trEl;
  },
  createMealEl(meal) {
    const liEl = document.createElement('li');
    liEl.dataset.id = meal.idMeal;

    insertHTML(
      liEl,
      `
      <div class="meal-card">
        <h4 class="meal-title"></h4>
        <img src="" alt="meal picture" class="meal-image" />
        <table class="meal-ingredients">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Measure</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
        <p class="meal-instructions"></p>
        <iframe
          class="meal-video"
          src=""
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
		  `
    );
    const tbodyEl = liEl.getElementsByTagName('tbody')[0];
    tbodyEl.append(
      ...meal.ingredients.map(ingredient => App.createIngredient(ingredient))
    );
    liEl.querySelector('.meal-title').textContent = meal.strMeal;
    liEl.querySelector('.meal-image').setAttribute('src', meal.strMealThumb);
    liEl.querySelector('.meal-ingredients');
    liEl.querySelector('.meal-instructions').textContent = meal.strInstructions;

    const videoParams = new URL(meal.strYoutube).searchParams;
    const videoId = videoParams.get('v');
    liEl
      .querySelector('.meal-video')
      .setAttribute('src', `https://www.youtube.com/embed/${videoId}`);

    return liEl;
  },
  render() {
    const count = Meals.all().length;
    App.$.showRecipeCount(count);
    App.$.showMealList();
    App.$.mealListEl.replaceChildren(
      ...Meals.all().map(meal => App.createMealEl(meal))
    );
  },
};

function resToWantedAdapter(meals) {
  return meals.map(meal => {
    const ingredients = [];

    for (let key in meal) {
      if (key.includes('strIngredient') && meal[key]) {
        let ingredientNum = key.match(/\d+/)[0];
        let strIngredient = meal[key];
        let strMeasure = meal[`strMeasure${ingredientNum}`];
        ingredients.push({ strIngredient, strMeasure });
      }
    }

    return { ...meal, ingredients };
  });
}

const insertHTML = (el, html) => el.insertAdjacentHTML('afterbegin', html);

App.init();
