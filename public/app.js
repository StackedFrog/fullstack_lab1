document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const recipeForm = document.getElementById('recipeForm');
    const editForm = document.getElementById('editForm');
    const recipesTableBody = document.getElementById('recipesTableBody');
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close');
    
    // get all recipes and add to the table
    function fetchRecipes() {
        fetch('/api/dishes')
            .then(response => response.json())
            .then(dishes => {
                recipesTableBody.innerHTML = '';
                dishes.forEach(dish => {
                    const row = document.createElement('tr');
                    
                    // format ingredients and steps for display
                    const ingredients = dish.ingredients.join(', ');
                    const prepSteps = dish.prepSteps.join(', ');
                    
                    row.innerHTML = `
                        <td>${dish.name}</td>
                        <td>${ingredients}</td>
                        <td>${dish.prepTime} mins</td>
                        <td>${dish.cookingTime} mins</td>
                        <td>${dish.origin}</td>
                        <td>${dish.difficulty}</td>
                        <td>${dish.spiceLevel}</td>
                        <td>
                            <button class="action-btn edit-btn" data-id="${dish.name}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${dish._id}">Delete</button>
                        </td>
                    `;
                    
                    recipesTableBody.appendChild(row);
                });
                
                // add event listeners to edit and delete buttons
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', handleEdit);
                });
                
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', handleDelete);
                });
            })
            .catch(error => {
                console.error('Error fetching recipes:', error);
                alert('Failed to load recipes. Please try again.');
            });
    }
    
    // to add new recipe
    recipeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            ingredients: document.getElementById('ingredients').value.split(',').map(item => item.trim()),
            prepSteps: document.getElementById('prepSteps').value.split(',').map(item => item.trim()),
            prepTime: parseInt(document.getElementById('prepTime').value),
            cookingTime: parseInt(document.getElementById('cookingTime').value),
            origin: document.getElementById('origin').value,
            difficulty: document.getElementById('difficulty').value,
            spiceLevel: document.getElementById('spiceLevel').value
        };
        
        fetch('/api/dishes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.status === 409) {
                throw new Error('A dish with this name already exists.');
            }
            if (!response.ok) {
                throw new Error('Failed to add recipe.');
            }
            return response;
        })
        .then(() => {
            alert('Recipe added successfully!');
            recipeForm.reset();
            fetchRecipes();
        })
        .catch(error => {
            console.error('Error adding recipe:', error);
            alert(error.message);
        });
    });
    
    // handle edit button click
    function handleEdit(e) {
        const dishName = e.target.getAttribute('data-id');
        
        fetch(`/api/dishes/${dishName}`)
            .then(response => response.json())
            .then(dish => {
                if (dish.length > 0) {
                    const selectedDish = dish[0];
                    
                    // fill in edit form with dish data
                    document.getElementById('editId').value = selectedDish._id;
                    document.getElementById('editName').value = selectedDish.name;
                    document.getElementById('editIngredients').value = selectedDish.ingredients.join(', ');
                    document.getElementById('editPrepSteps').value = selectedDish.prepSteps.join(', ');
                    document.getElementById('editPrepTime').value = selectedDish.prepTime;
                    document.getElementById('editCookingTime').value = selectedDish.cookingTime;
                    document.getElementById('editOrigin').value = selectedDish.origin;
                    document.getElementById('editDifficulty').value = selectedDish.difficulty;
                    document.getElementById('editSpiceLevel').value = selectedDish.spiceLevel;
                    
                    // modal
                    modal.style.display = 'block';
                } else {
                    throw new Error('Dish not found');
                }
            })
            .catch(error => {
                console.error('Error fetching dish for edit:', error);
                alert('Failed to load dish for editing. Please try again.');
            });
    }
    
    // edit form submission handler
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const dishId = document.getElementById('editId').value;
        const formData = {
            name: document.getElementById('editName').value,
            ingredients: document.getElementById('editIngredients').value.split(',').map(item => item.trim()),
            prepSteps: document.getElementById('editPrepSteps').value.split(',').map(item => item.trim()),
            prepTime: parseInt(document.getElementById('editPrepTime').value),
            cookingTime: parseInt(document.getElementById('editCookingTime').value),
            origin: document.getElementById('editOrigin').value,
            difficulty: document.getElementById('editDifficulty').value,
            spiceLevel: document.getElementById('editSpiceLevel').value
        };
        
        fetch(`/api/dishes/${dishId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update recipe.');
            }
            return response.json();
        })
        .then(() => {
            alert('Recipe updated successfully!');
            modal.style.display = 'none';
            fetchRecipes();
        })
        .catch(error => {
            console.error('Error updating recipe:', error);
            alert(error.message);
        });
    });
    
    // delete button click manager
    function handleDelete(e) {
        const dishId = e.target.getAttribute('data-id');
        
        if (confirm('Are you sure you want to delete this recipe?')) {
            fetch(`/api/dishes/${dishId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete recipe.');
                }
                return response;
            })
            .then(() => {
                alert('Recipe deleted successfully!');
                fetchRecipes();
            })
            .catch(error => {
                console.error('Error deleting recipe:', error);
                alert(error.message);
            });
        }
    }
    
    // exit modal when X is clicked
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // exit modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // fetch of recipes to intalise table 
    fetchRecipes();
})