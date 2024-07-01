import { check } from 'express-validator'
import { checkFileIsImage, checkFileMaxSize } from './FileValidationHelper.js'
import { Restaurant } from '../../models/models.js' // around 2Mb
import Sequelize from 'sequelize'
const maxFileSize = 2000000

/*
The maximum number of characters of a discount code is 10.
The discount is in the range [1, 99].
The discount code cannot be repeated for restaurants owned by the same owner.
*/
// SOLUCIÓN
const checkDiscountCodeOnlyOneRestaurant = async (value, ownerId) => {
  const code = await Restaurant.count({ where: { discountCode: value, userId: ownerId } })
  if (code >= 1) {
    return Promise.reject(new Error('The discount code can only be apply in one restaurant.'))
  } else {
    return Promise.resolve()
  }
}

const checkDiscountCodeOnlyOneRestaurantUpdate = async (value, ownerId, restaurantId) => {
  const code = await Restaurant.count({ where: { discountCode: value, userId: ownerId, id: { [Sequelize.Op.ne]: restaurantId } } })
  if (code >= 1) {
    return Promise.reject(new Error('The discount code can only be apply in one restaurant.'))
  } else {
    return Promise.resolve()
  }
}

const create = [
  check('name').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('description').optional({ nullable: true, checkFalsy: true }).isString().trim(),
  check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('postalCode').exists().isString().isLength({ min: 1, max: 255 }),
  check('url').optional({ nullable: true, checkFalsy: true }).isString().isURL().trim(),
  check('shippingCosts').exists().isFloat({ min: 0 }).toFloat(),
  check('email').optional({ nullable: true, checkFalsy: true }).isString().isEmail().trim(),
  check('phone').optional({ nullable: true, checkFalsy: true }).isString().isLength({ min: 1, max: 255 }).trim(),
  check('restaurantCategoryId').exists({ checkNull: true }).isInt({ min: 1 }).toInt(),
  check('userId').not().exists(),
  check('heroImage').custom((value, { req }) => {
    return checkFileIsImage(req, 'heroImage')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('heroImage').custom((value, { req }) => {
    return checkFileMaxSize(req, 'heroImage', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
  check('logo').custom((value, { req }) => {
    return checkFileIsImage(req, 'logo')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('logo').custom((value, { req }) => {
    return checkFileMaxSize(req, 'logo', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
  // SOLUCIÓN
  check('discountCode').optional({ nullable: true, checkFalsy: true }).isString().isLength({ min: 1, max: 10 }).trim(),
  check('discount').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 99 }).toFloat(),
  check('discountCode').custom((value, { req }) => {
    return checkDiscountCodeOnlyOneRestaurant(value, req.user.id)
  }).withMessage('Restaurant discount codes cannot repeat among restaurants of the same owner.')
]
const update = [
  check('name').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('description').optional({ nullable: true, checkFalsy: true }).isString().trim(),
  check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('postalCode').exists().isString().isLength({ min: 1, max: 255 }),
  check('url').optional({ nullable: true, checkFalsy: true }).isString().isURL().trim(),
  check('shippingCosts').exists().isFloat({ min: 0 }).toFloat(),
  check('email').optional({ nullable: true, checkFalsy: true }).isString().isEmail().trim(),
  check('phone').optional({ nullable: true, checkFalsy: true }).isString().isLength({ min: 1, max: 255 }).trim(),
  check('restaurantCategoryId').exists({ checkNull: true }).isInt({ min: 1 }).toInt(),
  check('userId').not().exists(),
  check('heroImage').custom((value, { req }) => {
    return checkFileIsImage(req, 'heroImage')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('heroImage').custom((value, { req }) => {
    return checkFileMaxSize(req, 'heroImage', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
  check('logo').custom((value, { req }) => {
    return checkFileIsImage(req, 'logo')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('logo').custom((value, { req }) => {
    return checkFileMaxSize(req, 'logo', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
  // SOLUCIÓN
  check('discountCode').optional({ nullable: true, checkFalsy: true }).isString().isLength({ min: 1, max: 10 }).trim(),
  check('discount').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 99 }).toFloat(),
  check('discountCode').custom((value, { req }) => {
    return checkDiscountCodeOnlyOneRestaurantUpdate(value, req.user.id, req.params.restaurantId)
  }).withMessage('Restaurant discount codes cannot repeat among restaurants of the same owner.')
]

export { create, update }
