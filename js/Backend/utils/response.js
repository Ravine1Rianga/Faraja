// Standard response helpers — all APIs use these so the frontend
// always gets { success, message, data } in the same shape.

const ok = (res, data = {}, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

const created = (res, data = {}, message = 'Created') =>
  ok(res, data, message, 201);

const fail = (res, message = 'Something went wrong', status = 400) =>
  res.status(status).json({ success: false, message });

const notFound = (res, message = 'Not found') =>
  fail(res, message, 404);

const unauthorized = (res, message = 'Unauthorized') =>
  fail(res, message, 401);

const forbidden = (res, message = 'Forbidden') =>
  fail(res, message, 403);

const serverError = (res, err) => {
  console.error(err);
  return fail(res, 'Internal server error', 500);
};

module.exports = { ok, created, fail, notFound, unauthorized, forbidden, serverError };
