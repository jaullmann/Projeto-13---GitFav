import { GithubUser } from "./GithubUser.js";

export class Favorites {
    
    constructor(root) {
        this.root = document.querySelector(root)
        this.localUserLoad()
    }

    localUserLoad() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    localUsersSave() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async addUser(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username)
            
            if (username.length < 3) {
                throw new Error('Usuário deve conter no mínimo três caracteres.')
            }

            if (userExists) {
                throw new Error('Usuário já existente na lista.')
            }

            const user = await GithubUser.search(username)

            if (user.login === undefined) {
                throw new Error('Usuário não encontrado.')
            }

            this.entries = [user, ...this.entries]
            this.updateUserList()
            this.localUsersSave()
        } catch(error) {
            alert(error.message)
        }
    }

    deleteUser(user) {
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)
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

    onAddNewUser() {
        try {
            const addButton = this.root.querySelector('#search-button')
            const userInput = this.root.querySelector('#user-input')
            addButton.onclick = () => {
                const { value } = userInput
                console.log(value.length)
                this.addUser(value)
                userInput.value = ''     
            }
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

    
    onSortTable() {
        const usersHeader = this.root.querySelector('#col-users')
        const repositoriesHeader = this.root.querySelector('#col-repositories')
        const followersHeader = this.root.querySelector('#col-followers')
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
        newRow.querySelector('.delete-user').onclick = () => {
            const isConfirmed = confirm('Deseja realmente remover esse usuário da lista?')
            if (isConfirmed) {
                this.deleteUser(user)
            }
        }
        
        this.tbody.append(newRow)
    } 

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