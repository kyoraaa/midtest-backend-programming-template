const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { getUserByRek } = require('./users-repository');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const users = await usersService.getUsers();
    const sort = request.query.sort;
    const search = request.query.search;
    
    let sortField = 'email';
    let sortOrder = 'asc';

    if (sort) {
      const [field, order] = sort.split(':');
      if (['email', 'name'].includes(field)) {
        sortField = field;
        if (order === 'desc') {
          sortOrder = 'desc';
        } else {
          sortOrder = 'asc';
        }
      }
    }
    let searchField = null;
    let searchKey = null;
    if (search) {
      const [field, key] = search.split(':');
      if (['email', 'name'].includes(field)) {
        searchField = field;
        searchKey = key;
      }
    }

    request.sortField = sortField;
    request.sortOrder = sortOrder;
    request.searchField = searchField;
    request.searchKey = searchKey;
    
    let filteredUsers = users;
    const page_number = parseInt(request.query.page_number);
    const page_size = parseInt(request.query.page_size);

    if (page_number && page_size) {
      if (request.searchField && request.searchKey) {
        filteredUsers = filteredUsers.filter((user) =>
          user[request.searchField].includes(request.searchKey)
        );
      }

      filteredUsers.sort((a, b) => {
        if (request.sortOrder === 'asc') {
          return a[request.sortField].localeCompare(b[request.sortField]);
        } else {
          return b[request.sortField].localeCompare(a[request.sortField]);
        }
      });


      const startIndex = (page_number - 1) * page_size;
      const endIndex = page_number * page_size;
      //count digunakan untuk menghitung jumlah data yang ada
      const count = filteredUsers.length;
      const data = filteredUsers.slice(startIndex, endIndex);
      const total_pages = Math.ceil(count / page_size);

      const prev = () => {
        return page_number > 1;
      };
      const after = () => {
        return page_number < total_pages;
      };

      const has_previous_page = prev();
      const has_next_page = after();

      return response.json({
        page_number,
        page_size,
        count,
        total_pages,
        has_previous_page,
        has_next_page,
        data,
      });

    } else {
      return response.json({ users });
    }
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    let rek =  parseInt(Math.floor(Date.now() / 10000));

    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;
    
    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }
    
    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(rek, name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({rek, name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getUserByRek
};
