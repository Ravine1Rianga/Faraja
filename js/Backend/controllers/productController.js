const db = require('../config/db');
const R  = require('../utils/response');

async function getProducts(req, res) {
  try {
    const vendorId = req.params.vendorId;
    let sql = 'SELECT p.*, v.business_name AS vendor_name FROM products p JOIN vendors v ON v.id = p.vendor_id';
    const params = [];
    if (vendorId) {
      sql += ' WHERE p.vendor_id = ?';
      params.push(vendorId);
    }
    sql += ' ORDER BY p.created_at DESC';
    const [products] = await db.query(sql, params);
    return R.ok(res, { products });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getActiveProducts(req, res) {
  try {
    const [products] = await db.query(
      `SELECT p.id, p.vendor_id, p.name, p.category, p.price, p.stock, p.description,
              p.image_url, p.created_at, v.business_name AS vendor_name
       FROM products p
       JOIN vendors v ON v.id = p.vendor_id
       WHERE p.status = 'active' AND v.status = 'active'
       ORDER BY p.created_at DESC`
    );
    return R.ok(res, { products });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getProduct(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT p.*, v.business_name AS vendor_name
       FROM products p JOIN vendors v ON v.id = p.vendor_id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return R.notFound(res, 'Product not found');
    return R.ok(res, { product: rows[0] });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function createProduct(req, res) {
  try {
    const { name, category, price, stock, description, imageUrl, status } = req.body;
    const vendorId = req.params.vendorId || req.body.vendorId;
    if (!name) return R.fail(res, 'Product name is required');
    if (!vendorId) return R.fail(res, 'Vendor ID is required');

    const [vendor] = await db.query('SELECT id, user_id FROM vendors WHERE id = ?', [vendorId]);
    if (!vendor[0]) return R.notFound(res, 'Vendor not found');
    const isOwner = vendor[0].user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return R.forbidden(res, 'Not authorized to add products to this vendor');
    }

    const [result] = await db.query(
      `INSERT INTO products (vendor_id, name, category, price, stock, description, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendorId, name, category || 'Other', price || 0, stock || 0, description || null, imageUrl || null, status || 'active']
    );

    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    return R.created(res, { product: product[0] }, 'Product created');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function updateProduct(req, res) {
  try {
    const productId = req.params.id;
    const { name, category, price, stock, description, imageUrl, status } = req.body;

    const [existing] = await db.query(
      'SELECT p.id, p.vendor_id, v.user_id FROM products p JOIN vendors v ON v.id = p.vendor_id WHERE p.id = ?',
      [productId]
    );
    if (!existing[0]) return R.notFound(res, 'Product not found');
    const isOwner = existing[0].user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return R.forbidden(res, 'Not authorized to update this product');
    }

    const updates = [];
    const values  = [];
    if (name !== undefined)        { updates.push('name = ?');        values.push(name); }
    if (category !== undefined)    { updates.push('category = ?');    values.push(category); }
    if (price !== undefined)       { updates.push('price = ?');       values.push(price); }
    if (stock !== undefined)       { updates.push('stock = ?');       values.push(stock); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (imageUrl !== undefined)    { updates.push('image_url = ?');   values.push(imageUrl); }
    if (status !== undefined)      { updates.push('status = ?');      values.push(status); }

    if (!updates.length) return R.fail(res, 'Nothing to update');

    values.push(productId);
    await db.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    return R.ok(res, { product: product[0] }, 'Product updated');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function deleteProduct(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.vendor_id, v.user_id FROM products p
       JOIN vendors v ON v.id = p.vendor_id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return R.notFound(res, 'Product not found');
    // Allow if user is admin or owns the vendor
    const isOwner = rows[0].user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return R.forbidden(res, 'Not authorized to delete this product');
    }
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    return R.ok(res, {}, 'Product deleted');
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { getProducts, getActiveProducts, getProduct, createProduct, updateProduct, deleteProduct };
