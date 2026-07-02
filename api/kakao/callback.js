module.exports = async function handler(req, res) {
  const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");
  const error = req.query.error;
  const code = req.query.code;

  if (!siteUrl) {
    return res.status(500).send("SITE_URL 환경 변수가 필요합니다.");
  }

  if (error) {
    return res.redirect(302, `${siteUrl}/?auth_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.status(400).send("인가 코드가 없습니다.");
  }

  const clientId = process.env.KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const redirectUri = `${siteUrl}/api/kakao/callback`;

  if (!clientId || !clientSecret) {
    return res.status(500).send("KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET 환경 변수가 필요합니다.");
  }

  const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.id_token) {
    console.error("Kakao token exchange failed:", tokenData);
    return res.redirect(302, `${siteUrl}/?auth_error=kakao_token_failed`);
  }

  res.redirect(
    302,
    `${siteUrl}/#kakao_id_token=${encodeURIComponent(tokenData.id_token)}`
  );
};
