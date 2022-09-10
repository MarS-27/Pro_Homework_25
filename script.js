const API = "https://631705e3cb0d40bc414978a1.mockapi.io";

const heroComics = document.getElementById("heroComics");
const heroesForm = document.getElementById("heroesForm");

const controller = async (path, method = "GET", body) => {
    const URL = `${API}/${path}`;

    const params = {
        method,
        headers: {
            "content-type": "application/json",
        }
    }

    if(body) params.body = JSON.stringify(body);

    let request = await fetch(URL, params);

    if (request.ok) {
        let responce = await request.json();
        return responce;
    } else {
        alert(`Error ${request.status}! ${request.statusText}`);
    }
}

async function renderComics() {
    const allUniverses = await controller("universes");

    allUniverses.forEach(elem => {
        const comicsOption = `
            <option value=${elem.name}>${elem.name}</option>
        `;

        heroComics.insertAdjacentHTML("afterbegin", comicsOption);
    })
}

renderComics();

heroesForm.addEventListener("submit", async e => {
    e.preventDefault();

    const heroName = document.getElementById("heroName").value.trim();
    const heroFavourite = document.getElementById("heroFavourite").checked;

    const heroes = await controller("heroes");

    const hero = heroes.find(elem => elem.name.toLowerCase() === heroName.toLowerCase());

    if (hero) {
        const modalWindow = document.getElementById("modal");
        const buttonYes = document.getElementById("btn-yes");
        const buttonNo = document.getElementById("btn-no");
        
        modalWindow.classList.add("show-modal");

        buttonYes.addEventListener("click", () => {
            const heroId = document.getElementById(`${hero.id}`);

            if (!heroId) {
                const newHero = new Hero(hero);
                newHero.render();
            }
            
            modalWindow.classList.remove("show-modal");
            heroesForm.reset();
        })

        buttonNo.addEventListener("click", () => {
            modalWindow.classList.remove("show-modal");
            heroesForm.reset();
        })

    } else {
        const body = {
            name: heroName,
            comics: heroComics.value,
            favourite: heroFavourite,
        }

        if (heroName !== "") {
            const addHero = await controller("heroes", "POST", body);
        
            if(addHero) {
                const newHero = new Hero(addHero);
                newHero.render();
                heroesForm.reset();
            }
        } else {
            alert("Please, enter hero name!");
        }
    } 
})

class Hero {
    constructor(heroObj) {
        for(let key in heroObj) {
            this[key] = heroObj[key];
        }
    }

    render() {
        const tBody = document.getElementById("tbody");
        
        const trList = `
            <tr id=${this.id}>
                <td>${this.name}</td>
                <td>${this.comics}</td>
                <td>
                    <label class="heroFavouriteInput">
                        Favourite: 
                        <input type="checkbox" ${this.favourite ? "checked" : ""} id="favouriteInputInTable">
                    </label>
                </td>
                <td>
                    <button class="button" id="delete-btn">Delete hero</button>
                </td>
            </tr>
        `;

        tBody.insertAdjacentHTML("afterbegin", trList);

        const deleteBtn = document.getElementById("delete-btn");
        const changeFavourite = document.getElementById("favouriteInputInTable");
        
        deleteBtn.addEventListener("click", async () => {
            const heroInfo = document.getElementById(`${this.id}`);
            
            const deleteHero = await controller(`heroes/${this.id}`, "DELETE");
                   
            if (deleteHero.id) {
                heroInfo.remove();
            } 
        })

        changeFavourite.addEventListener("change", async () => {
            const body = {
                name: this.name,
                comics: this.comics,
                favourite: changeFavourite.checked,
            };

            const changeResponce = await controller(`heroes/${this.id}`, "PUT", body);

            if (changeFavourite.checked) {
                changeFavourite.setAttribute("checked", "checked");
            } else {
                changeFavourite.removeAttribute("checked");
            }
        })
    }
}