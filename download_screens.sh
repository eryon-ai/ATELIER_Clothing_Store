#!/bin/bash
set -e
DIR="public/screens"
mkdir -p "$DIR"

echo "Downloading all 30 Stitch screens..."

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2I1NDNjODJmYmRkODRhYTg4MzJhZjdjMjU5MjBiMWIwEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/home-detailed.html" && echo "✓ home-detailed.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzZjZmI4NzUwYWQyYzQxZGVhZjhhMmQxN2I0M2NjOTUzEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/cart-premium.html" && echo "✓ cart-premium.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzM4NWQ4MjAxZmI4NTQyMjBiOTlhOWU2ZmY2NTUzZDM3EgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/oversized.html" && echo "✓ oversized.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2VhZmI1Y2I2YjEwYzRlN2ZhMmFlNzA1OWY3MTBmMzE3EgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/anime.html" && echo "✓ anime.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzU3NTA2ZWI4M2EyNDQ3YTdhZjU1NzAyMDAwYjJmMzIxEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/best-sellers.html" && echo "✓ best-sellers.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2JmZDY5M2MxYWI4OTQ1ODJhZWViYTFlMjkxM2QyYjc1EgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/sneakers.html" && echo "✓ sneakers.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2E4OGE5YmVmZjUxMDQ2Yzc5YmIyMzZiZDY5NzE2NTQ2EgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/streetwear-light.html" && echo "✓ streetwear-light.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzU4N2IyN2FlODUxYzRlMWZhOThkYThjYmQyNzA1ODY2EgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/cart.html" && echo "✓ cart.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzczMmI0ZjZhN2RmMzQ4ZWE4MDI1NGE3OTc2MDg5YTc4EgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/marvel.html" && echo "✓ marvel.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2MzYzcyMzI1NjgwMDQ5YTlhN2MyN2E2YmM4MjBiN2ZlEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/trending.html" && echo "✓ trending.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2Y1MmZiNTU0NGZkMDQ5NGJiYWFlYjU2ZTIxOGFlNGYxEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/accessories.html" && echo "✓ accessories.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzdhZGRmYmNkMzgzMzQ5ZDZhYzExZDRiZjQ4NzdjNGM0EgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/home-light.html" && echo "✓ home-light.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzYzMDliZGFiNTQwMjRlNzM4ODc5NWUwOGYyOGQzNTY5EgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/sale.html" && echo "✓ sale.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2JhMzFiZWNhYmM0ZTRhNWRhYTgxMjRmMzcyYTAxYzBkEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/gym.html" && echo "✓ gym.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzEyZjI0ZDEyZWE0NTQ2YWViODU1YWJlM2EzNWU2N2FkEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/festival.html" && echo "✓ festival.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2UwMjhiNGUzYzkzMjQzOWQ5MTRlZTQ4OTE1NmZjOGMyEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/pdp.html" && echo "✓ pdp.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2E3MzRjMGMxODlmZjRhZTZiM2RlNjk5MDg1ZTdkMWU1EgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/admin.html" && echo "✓ admin.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQ0MTE5MWQ3ZmRiNzQ4Mjc5NzYwZmVhNjgzZDRhMWFiEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/men.html" && echo "✓ men.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzY5ZGUwYTEyMWM1MzRiYTJhYjQ0NzA2NGFjOWNkY2NiEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/summer.html" && echo "✓ summer.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzkwN2FlZTJjYThiZDRiM2M4NGQ2ODlmYzAxNmRhMmVlEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/women.html" && echo "✓ women.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2M3ZDVmNjNkMDY5ZDRjM2I5MWUyYWQ5MDEyYTk1MjA5EgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/new-arrivals.html" && echo "✓ new-arrivals.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzg5N2IzZmEwOTIxNzQ4ODY4MTBmNmQyYWQ2NzdmYTI1EgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/limited.html" && echo "✓ limited.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzE3NTI3Y2YyZjczNTRhZGJiY2VlZmI5OWMxOTE5NmJkEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/footwear.html" && echo "✓ footwear.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzRhNTIyNTFkMjEwZDRlNDdiMjE1ZWEzMDNhZTEzZTUzEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/winter.html" && echo "✓ winter.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2JhOGU0ZDJiZjFjMzQ1Y2Q4MDllMmZmNmVkOGZlNTJhEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/premium.html" && echo "✓ premium.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzM1Njk3MmNmNmE1NDQwNWI4YTViYjE0ZGY0OGIxNzZkEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/collab.html" && echo "✓ collab.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzU5NzIzNTMyNzMyOTRlYWQ4Y2RhZjMzNGE0ZjEyODRkEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/dashboard.html" && echo "✓ dashboard.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzZlMmJhNThjYTkzYzQ2M2NiZWE2MmUzOWM4MzMwODYxEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/editorial-home.html" && echo "✓ editorial-home.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzMzZDU0ZGE4ZTYyOTQ5Y2JiZmZjY2UzZDE2OTkxY2IyEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/parka.html" && echo "✓ parka.html"

curl -sL "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzZlZjNiNjc0NTQzOTQzNjI5NDEwZTVlMDFjZTRkNzFiEgsSBxCGgZjY3QIYAZIBJAoKcHJvamVjdF9pZBIWQhQxNzQwNTA2MzI5MDU2Njk5NDcyOA&filename=&opi=89354086" -o "$DIR/streetwear-core.html" && echo "✓ streetwear-core.html"

echo ""
echo "✅ All 30 screens downloaded!"
ls -la "$DIR/"
