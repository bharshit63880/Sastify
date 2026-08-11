const rules = [
  ["Electronics", /electronics|computer|laptop|phone|tablet|headphone|earbud|speaker|camera|television|smartwatch/i],
  ["Beauty & Wellness", /beauty|skin|hair|makeup|personal care|wellness/i],
  ["Sports & Fitness", /sport|fitness|exercise|outdoor|cycling|running|camping|yoga|dumbbell/i],
  ["Fashion", /clothing|fashion|women|men|shoe|dress|shirt|jeans|jacket|bag|jewelry|watch/i],
  ["Home & Kitchen", /home|kitchen|furniture|decor|garden|appliance|bedding|bath|storage|cookware/i],
];

const mapCategory = (text) => rules.find(([, pattern]) => pattern.test(text))?.[0] || null;
module.exports = { mapCategory };
