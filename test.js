
async function test() {
  const q = encodeURIComponent('*[_type == "brandWork"]{title, category}');
  const res = await fetch('https://egixwbp1.api.sanity.io/v2024-05-01/data/query/production?query=' + q);
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
test();

