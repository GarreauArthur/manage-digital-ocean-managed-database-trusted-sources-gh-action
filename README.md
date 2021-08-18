# manage-digital-ocean-managed-database-trusted-sources-gh-action


(this is scuffed, I am doing it in a hurry)

Github action to add or remove the IP address of your github hosted runner, to
the list of the trusted sources of your digital ocean managed database. To be 
able to let the GH runner interact with your database.

So here's the scenario:

* You are creating a workflow using Github actions,
* and you are using a Digital Ocean Managed Database.
* You are also a responsible human being, and decided to limit the access of your
databases to trusted sources only.
* **But**, you realize that your CI/CD workflow **needs to interact with your database**,
* and because you are cheap or lazy (or both like me)
* you don't want to set up a droplet to host your runner.
* You just want to use Github hosted runners to run your workflow.
* But you doubt that github runners always are the same with the same IP address
* So you decided to use **this action** to add and remove the runner's IP address
to the list of trusted sources of your database.

I know this name is very long and annoying, but I tried to be explicit, the worst
is that I kind of failed.

## Input variables

See [action.yml](./action.yml) for more information.

* `action`: whether you want to `"add"` or `"remove"` the IP address to the trusted sources 
* `database_id`: The ID of your managed database (in UUID format). You can find it with `doctl databases list` (cf. [Digital Ocean Doc](https://docs.digitalocean.com/reference/doctl/reference/databases/list/))
* `digitalocean_token`: A personal access token to digital ocean. Find out [here](https://docs.digitalocean.com/reference/api/create-personal-access-token/) to know how to create one.

Best practice: Use GitHub Secrets to store the `database_id` and `digitalocean_token`.

## How to use it ?

In your workflow:

```yaml
# Step 1, add the IP address
- name: Add IP address to trusted source (managed database)
  uses: GarreauArthur/manage-digital-ocean-managed-database-trusted-sources-gh-action@main
  with:
    action: "add"
    database_id: ${{ secrets.DATABASE_ID }}
    digitalocean_token: ${{ secrets.DIGITALOCEAN_TOKEN }}

# Step 2, do whatever you need to do with you database
- name: Do something with you database
  run: echo "Migrating database"

# Step 3, remove the IP address
- name: Remove IP address to trusted source (managed database)
  uses: GarreauArthur/manage-digital-ocean-managed-database-trusted-sources-gh-action@main
  with:
    action: "remove"
    database_id: ${{ secrets.DATABASE_ID }}
    digitalocean_token: ${{ secrets.DIGITALOCEAN_TOKEN }}
```

## Info for devs

1. Clone this repo
2. `npm i`
3. Do the thing (code)
4. Build with `npm build`
5. commit & push
6. create pull request

or

1. Fork the project ^^

## TODO list

Probably never going to do this.

* [ ] Set up workflow to automatically build the action
* [ ] Let users the ability to choose the IP address they want to add/remove
* [ ] Let users the ability to choose the rule they want to add.
* [ ] finish the todo list
