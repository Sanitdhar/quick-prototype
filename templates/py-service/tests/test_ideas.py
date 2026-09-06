from fastapi.testclient import TestClient


def test_create_and_list_idea(client: TestClient) -> None:
    create_response = client.post("/ideas", json={"title": "Ship a prototype"})
    assert create_response.status_code == 201
    created = create_response.json()
    assert created["title"] == "Ship a prototype"

    list_response = client.get("/ideas")
    assert list_response.status_code == 200
    assert [idea["title"] for idea in list_response.json()] == ["Ship a prototype"]


def test_delete_idea(client: TestClient) -> None:
    created = client.post("/ideas", json={"title": "Temporary idea"}).json()

    delete_response = client.delete(f"/ideas/{created['id']}")
    assert delete_response.status_code == 204

    list_response = client.get("/ideas")
    assert list_response.json() == []


def test_delete_missing_idea_returns_404(client: TestClient) -> None:
    response = client.delete("/ideas/999")
    assert response.status_code == 404
