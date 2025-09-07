import requests
import json

# API base (exemplo: https://fastwheelsapi.joedots1.repl.co/car/2018)
API_BASE = "https://fastwheelsapi.joedots1.repl.co/car/"

# Período de interesse (pode mudar)
anos = list(range(2010, 2021))

# Lista para os resultados
miniaturas = []

for ano in anos:
    print(f"Baixando ano {ano}...")
    url = f"{API_BASE}{ano}"
    resp = requests.get(url)
    if resp.status_code != 200:
        print(f"Erro ao buscar {url}")
        continue
    carros = resp.json()
    for car in carros:
        mini = {
            "model_name": car.get("name", "").strip().upper(),
            "brand": car.get("manufacturer", "").strip().title(),
            "base_color": car.get("color", "").strip().title(),
            "year": car.get("year", ano),
            "series": car.get("series", "").strip().title(),
            "collection_number": car.get("number", "").strip(),
            "upc": car.get("upc", "").strip()
        }
        # Remove modelos incompletos
        if mini["model_name"]:
            miniaturas.append(mini)

# Remove duplicados (por model_name, brand e year)
seen = set()
unique_miniaturas = []
for m in miniaturas:
    key = (m["model_name"], m["brand"], m["year"])
    if key not in seen:
        seen.add(key)
        unique_miniaturas.append(m)

# Salva em JSON no formato esperado pelo seu app!
with open("hotwheels_lookup.json", "w", encoding="utf-8") as f:
    json.dump(unique_miniaturas, f, ensure_ascii=False, indent=2)

print(f"Salvo: {len(unique_miniaturas)} miniaturas em hotwheels_lookup.json")
