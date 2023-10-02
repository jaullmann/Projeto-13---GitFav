import { GithubUser } from "./GithubUser.js";

export class Favorites {
    
    constructor(root) {
        this.root = document.querySelector(root)
        this.localUserLoad()
    }

    // function to load local user data from browser
    localUserLoad() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    // function to save/update local user data from browser
    localUsersSave() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    // function to add new user to the main table using data from Github API
    async addUser(username) {
        try {
            // boolean to check whether user already exists in local entries
            const userExists = this.entries.find(entry => entry.login === username)
            
            // name lenght must be equal or greater than 3
            if (username.length < 3) {
                throw new Error('Usuário deve conter no mínimo três caracteres.')
            }

            if (userExists) {
                throw new Error('Usuário já existente na lista.')
            }

            // async function to get user data from Git
            const user = await GithubUser.search(username)

            // throw error if Git user does not exist
            if (user.login === undefined) {
                throw new Error('Usuário não encontrado.')
            }

            // add new user in the first position of the local entries array
            this.entries = [user, ...this.entries]

            this.updateUserList()
            this.localUsersSave()
        } catch(error) {
            alert(error.message)
        }
    }

    // function to delete users
    deleteUser(user) {
        // filters current entries array removing the target user to be deleted
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)
        // updates the current entries list with the filtered list from above
        this.entries = filteredEntries
        this.updateUserList()
        this.localUsersSave()
    }

}


export class FavoritesView extends Favorites {

    constructor(root) {
        super(root)
        this.userAscending = true
        this.repoAscending = false
        this.followersAscending = false        
        this.tbody = this.root.querySelector('table tbody')

        this.updateUserList()
        this.onAddNewUser()
        this.onSortTable()
        console.log(this.entries.length)
    }

    // listener functions to add new user
    onAddNewUser() {
        try {
            const addButton = this.root.querySelector('#search-button')
            const userInput = this.root.querySelector('#user-input')
            // listener function to add new user by clicking on add new user button
            addButton.onclick = () => {
                const { value } = userInput
                console.log(value.length)
                this.addUser(value)
                // clears the user input field after adding the new user
                userInput.value = ''     
            }
            // listener funcion to add new user by pressing Enter key after typing the name
            userInput.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter') {
                    const { value } = userInput
                    this.addUser(value)
                    userInput.value = ''   
                }
            })
        } catch(error) {
            alert(error.message)
        }
        
    }

    //function to sort the users table
    onSortTable() {
        const usersHeader = this.root.querySelector('#col-users')
        const repositoriesHeader = this.root.querySelector('#col-repositories')
        const followersHeader = this.root.querySelector('#col-followers')
        // listener function to sort users by name
        usersHeader.onclick = () => {
            if (this.entries.length > 1) {
                if (this.userAscending) {
                    this.entries = this.entries.sort((a, b) => a.name.localeCompare(b.name))
                } else {
                    this.entries = this.entries.sort((a, b) => b.name.localeCompare(a.name))
                }
                this.userAscending = !this.userAscending
                this.updateUserList()
            }            
        }
        // listener function to sort users by the ammount of public repositories 
        repositoriesHeader.onclick = () => {
            if (this.entries.length > 1) {
                if (this.repoAscending) {
                    this.entries = this.entries.sort((a, b) => a.public_repos - b.public_repos)
                } else {
                    this.entries = this.entries.sort((a, b) => b.public_repos - a.public_repos)
                }
                this.repoAscending = !this.repoAscending
                this.updateUserList()
            }            
        }
        // listener function to sort users by the ammount of followers
        followersHeader.onclick = () => {
            if (this.entries.length > 1) {
                if (this.followersAscending) {
                    this.entries = this.entries.sort((a, b) => a.followers - b.followers)
                } else {
                    this.entries = this.entries.sort((a, b) => b.followers - a.followers)
                }
                this.followersAscending = !this.followersAscending
                this.updateUserList()
            }            
        }      

    }

    // function to create an html row for a new user
    createUserRow(user) {
        const newRow = document.createElement('tr')
        newRow.innerHTML = `
            <td class="user">
                <div class="user-data">
                    <img src="https://github.com/${user.login}.png" alt="Imagem de ${user.name}">                       
                    <a href="https://github.com/${user.login}" target="_blank">
                        <p>${user.name}</p>
                        <span>/${user.login}</span>
                    </a>  
                </div>                                                              
            </td>
            <td class="repositories">${user.public_repos}</td>
            <td class="followers">${user.followers}</td>
            <td class="delete-user">Remover</td>
        `
        // listener function for delete users buttons
        newRow.querySelector('.delete-user').onclick = () => {
            const isConfirmed = confirm('Deseja realmente remover esse usuário da lista?')
            if (isConfirmed) {
                this.deleteUser(user)
            }
        }
        
        this.tbody.append(newRow)
    } 

    // function to create an empty table in case of empty users list
    createEmptyTable() {
        const emptyList = document.createElement('tr')
        emptyList.innerHTML = `
            <td id="empty-user-list">
                <img src="./assets/favStar.svg" alt="Ícone de favoritos em formato de estrela">
                <h1>Nenhum favorito ainda</h1>
            </td>   
        `
        this.tbody.append(emptyList)
        console.log(`Criada tabela sem usuários`)
    }
    
    // function that updates users list by deleting all rows and recreating the whole table
    updateUserList() {
        this.deleteAllRows()
        if(this.entries.length > 0) {
            this.entries.forEach(user => {
                const newRow = this.createUserRow(user)
            })
        } else {
            this.createEmptyTable()
        }       
    }

    deleteAllRows() {
        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove()
        })  
    }

}