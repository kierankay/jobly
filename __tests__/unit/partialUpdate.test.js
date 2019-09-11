let partialUpdate = require('../../helpers/partialUpdate');

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {
        let val = partialUpdate('companies', {num_employees: 5}, 'handle', 'somecompany')
    // FIXME: write real tests!
    expect(val).toEqual({
      query: `UPDATE companies SET num_employees=$1 WHERE handle=$2 RETURNING *`,
      values: [5, 'somecompany']
    });

  });
});
