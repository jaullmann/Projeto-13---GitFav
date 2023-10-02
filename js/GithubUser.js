export class GithubUser {
    // async static function that gets a json data from Github users by the username provided
    static async search(username) {
        const endpoint = `https://api.github.com/users/${username}`

        const resp = await fetch(endpoint)
        const userData = await resp.json()
        userData.name = userData.name || userData.login
        const { name, login, public_repos, followers } = userData
        return { name, login, public_repos, followers }
    }
}